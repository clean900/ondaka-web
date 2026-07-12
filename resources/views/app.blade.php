<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'ONDAKA') }}</title>

    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    {{-- Open Graph / partilha em redes e WhatsApp --}}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="ONDAKA">
    <meta property="og:title" content="ONDAKA — Gestão de Condomínios">
    <meta property="og:description" content="A plataforma de gestão de condomínios criada para Angola.">
    <meta property="og:image" content="https://ondaka.ao/img/ondaka-og.png">
    <meta name="twitter:card" content="summary_large_image">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:300,400,500,600,700,800&display=swap" rel="stylesheet" />

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased mesh-bg min-h-screen text-white">
    @inertia
</body>
</html>
