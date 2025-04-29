<?php
// Configuração do banco de dados
$host = 'lgcarcbdatabase.mysql.db';
$usuario = 'lgcarcbdatabase';
$senha = 'Bunda2005Dse3bus';  // Adicione sua senha aqui
$base_dados = 'lgcarcbdatabase';

// Define max allowed packet size - important for BLOB uploads
ini_set('memory_limit', '256M'); // Increase PHP memory limit for handling large files
ini_set('post_max_size', '64M'); // Increase post max size
ini_set('upload_max_filesize', '64M'); // Increase upload max filesize

// Criar conexão
$conn = new mysqli($host, $usuario, $senha, $base_dados);

// Verificar conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Configure mysqli to handle larger packets for BLOBs
$conn->query("SET max_allowed_packet=67108864"); // 64MB in bytes

// Configurar charset
$conn->set_charset("utf8mb4");

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'db_errors.log');

// Log function
function db_log($message) {
    error_log(date('[Y-m-d H:i:s] ') . $message . PHP_EOL, 3, 'db_errors.log');
}

// Criar diretório de uploads se não existir
if (!file_exists('uploads')) {
    mkdir('uploads', 0755, true);
}

// Iniciar sessão
session_start();
?> 