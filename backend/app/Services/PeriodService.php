<?php

namespace App\Services;

use App\Models\Setting;
use Carbon\Carbon;

class PeriodService
{
    public function currentMonthPeriod(): array
    {
        return $this->periodContaining(Carbon::now(config('app.business_timezone')));
    }

    /**
     * Retorna o período (dia_inicio_mes a dia_inicio_mes) que contém a data
     * informada. Usado tanto para o período vigente (currentMonthPeriod)
     * quanto para construir séries históricas mês a mês (ex.:
     * FinanceController::seriesByMonth), garantindo que a mesma regra de
     * dia_inicio_mes seja aplicada a cada mês da série, não só ao atual.
     */
    public function periodContaining(Carbon $date): array
    {
        $tz  = config('app.business_timezone');
        $dia = (int) Setting::get('dia_inicio_mes', 1);

        $date = $date->copy()->setTimezone($tz);

        $anchorYear  = $date->year;
        $anchorMonth = $date->month;

        // Compara com o dia já "clampado" ao mês da data informada (ver
        // buildPeriodStart) — essencial para meses em que dia_inicio_mes não
        // existe nesse mês (ex.: 29/30/31 em fevereiro). Sem esse clamp aqui,
        // o último dia do mês seria erroneamente jogado para o período
        // anterior mesmo quando ele já é, na prática, o início do período
        // vigente.
        $clampedDiaThisMonth = min($dia, Carbon::create($anchorYear, $anchorMonth, 1, 0, 0, 0, $tz)->daysInMonth);

        if ($date->day < $clampedDiaThisMonth) {
            $anchorMonth--;
            if ($anchorMonth < 1) {
                $anchorMonth = 12;
                $anchorYear--;
            }
        }

        $start = $this->buildPeriodStart($anchorYear, $anchorMonth, $dia, $tz);
        $next  = $this->nextPeriodStart($anchorYear, $anchorMonth, $dia, $tz);
        $end   = $next->copy()->subSecond();

        return ['start' => $start, 'end' => $end];
    }

    /**
     * Retorna o período imediatamente seguinte ao período informado.
     */
    public function nextPeriod(array $period): array
    {
        return $this->periodContaining($period['end']->copy()->addSecond());
    }

    /**
     * Constrói o início do período no ano/mês informados, usando o dia
     * configurado (dia_inicio_mes). Meses com menos dias que o configurado
     * (ex.: dia_inicio_mes=31 em abril, ou 29/30/31 em fevereiro) usam o
     * último dia válido daquele mês como início, em vez de estourar para o
     * mês seguinte.
     */
    private function buildPeriodStart(int $year, int $month, int $dia, string $tz): Carbon
    {
        $daysInMonth = Carbon::create($year, $month, 1, 0, 0, 0, $tz)->daysInMonth;
        $day = min($dia, $daysInMonth);

        return Carbon::create($year, $month, $day, 0, 0, 0, $tz)->startOfDay();
    }

    private function nextPeriodStart(int $anchorYear, int $anchorMonth, int $dia, string $tz): Carbon
    {
        $month = $anchorMonth + 1;
        $year  = $anchorYear;

        if ($month > 12) {
            $month = 1;
            $year++;
        }

        return $this->buildPeriodStart($year, $month, $dia, $tz);
    }
}
