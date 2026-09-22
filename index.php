<?php
/**
 * Hostinger Root Fallback
 * Ensures that if Hostinger points the domain to the repository root
 * instead of the /dist folder, the built React SPA is served cleanly.
 */
$distIndexPath = __DIR__ . '/dist/index.html';

if (file_exists($distIndexPath)) {
    // If request is for an asset file in /dist/assets, forward correct Content-Type
    $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $targetFile = __DIR__ . '/dist' . $requestUri;

    if (!empty($requestUri) && $requestUri !== '/' && file_exists($targetFile) && !is_dir($targetFile)) {
        $ext = pathinfo($targetFile, PATHINFO_EXTENSION);
        $mimes = [
            'css'  => 'text/css',
            'js'   => 'application/javascript',
            'png'  => 'image/png',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'svg'  => 'image/svg+xml',
            'ico'  => 'image/x-icon',
            'json' => 'application/json',
            'woff' => 'font/woff',
            'woff2'=> 'font/woff2'
        ];
        if (isset($mimes[$ext])) {
            header('Content-Type: ' . $mimes[$ext]);
        }
        readfile($targetFile);
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    readfile($distIndexPath);
    exit;
}

// Fallback message if build hasn't run yet
http_response_code(503);
echo "<h1>Prato & Pata</h1><p>Aguardando conclusao do build ('npm run build')...</p>";
