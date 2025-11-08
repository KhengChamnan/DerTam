<?php

// PayWay will POST data here
$payload = file_get_contents("php://input");
$data = json_decode($payload, true);

// Log into file for testing
file_put_contents("return_log.txt", $payload . PHP_EOL, FILE_APPEND);

// Just display response for now
header("Content-Type: application/json");
echo json_encode([
    "status" => "RECEIVED",
    "data" => $data
]);
