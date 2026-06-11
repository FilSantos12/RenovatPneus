<?php
// Gera certificado autoassinado e stunnel.conf para HTTPS local.
// Uso: php ssl_generate.php <diretorio_destino> [porta_https] [porta_http]
$sslDir   = $argv[1] ?? __DIR__;
$portSsl  = $argv[2] ?? '8443';
$portHttp = $argv[3] ?? '8000';

if (!extension_loaded('openssl')) {
    fwrite(STDERR, "ERRO: extensao openssl nao esta habilitada no php.ini\n");
    exit(1);
}

// Localiza openssl.cnf relativo ao PHP bundled (necessario no Windows)
$phpDir    = dirname(PHP_BINARY);
$opensslCnf = $phpDir . DIRECTORY_SEPARATOR . 'extras' . DIRECTORY_SEPARATOR . 'ssl' . DIRECTORY_SEPARATOR . 'openssl.cnf';
if (!file_exists($opensslCnf)) {
    $opensslCnf = $phpDir . DIRECTORY_SEPARATOR . 'openssl.cnf';
}

$config = [
    'digest_alg'       => 'sha256',
    'private_key_bits' => 2048,
    'private_key_type' => OPENSSL_KEYTYPE_RSA,
    'config'           => file_exists($opensslCnf) ? $opensslCnf : null,
];

$dn = ['CN' => 'RenovatPneus-Local', 'O' => 'RenovatPneus', 'C' => 'BR'];

$key = openssl_pkey_new($config);
if (!$key) { fwrite(STDERR, "ERRO: falha ao gerar chave privada\n"); exit(1); }

$csr = openssl_csr_new($dn, $key, $config);
if (!$csr) { fwrite(STDERR, "ERRO: falha ao criar CSR\n"); exit(1); }

$cert = openssl_csr_sign($csr, null, $key, 3650, $config);
if (!$cert) { fwrite(STDERR, "ERRO: falha ao assinar certificado\n"); exit(1); }

openssl_x509_export($cert, $certPem);
openssl_pkey_export($key, $keyPem, null, $config);

@mkdir($sslDir, 0755, true);
file_put_contents($sslDir . DIRECTORY_SEPARATOR . 'server.crt', $certPem);
file_put_contents($sslDir . DIRECTORY_SEPARATOR . 'server.key', $keyPem);
echo "Certificado gerado em: $sslDir\n";

$crtPath = $sslDir . DIRECTORY_SEPARATOR . 'server.crt';
$keyPath = $sslDir . DIRECTORY_SEPARATOR . 'server.key';

$conf = implode("\r\n", [
    '[renovatpneus-https]',
    "accept  = 0.0.0.0:$portSsl",
    "connect = 127.0.0.1:$portHttp",
    "cert    = $crtPath",
    "key     = $keyPath",
    '',
]);

file_put_contents($sslDir . DIRECTORY_SEPARATOR . 'stunnel.conf', $conf);
echo "stunnel.conf gerado.\n";
