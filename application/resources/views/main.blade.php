<!DOCTYPE html>
<html>
    <head>

        {{-- Set base url if admin has enabled HTML5 push state --}}
        @if ($settings->get('enablePushState'))
            <base href="{{ $pushStateRootUrl }}">
        @endif

        <title>{{ $settings->get('siteName') }}</title>

        {{-- Meta --}}
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="{{ $settings->get('metaDescription') }}" />
        <meta name="title" content="{{ $settings->get('metaTitle') }}" />

        {{-- CSS For Splash Spinner --}}
        <style>[ng-cloak]#splash{display:block!important}[ng-cloak]{display:none}#splash{display:none;position:absolute;top:45%;left:48%;width:50px;height:50px;z-index:0;animation:loader 2s infinite ease;border:4px solid #ff5722}#splash-spinner{vertical-align:top;display:inline-block;width:100%;background-color:#ff5722;animation:loader-inner 2s infinite ease-in}@keyframes loader{0%{transform:rotate(0deg)}25%,50%{transform:rotate(180deg)}100%,75%{transform:rotate(360deg)}}@keyframes loader-inner{0%,25%{height:0}50%,75%{height:100%}100%{height:0}}</style>
        {{-- CSS --}}
        <link rel="stylesheet" href="{{ asset('assets/css/styles.min.css?v31') }}">

        {{-- Fonts --}}
        <link href='https://fonts.googleapis.com/css?family=RobotoDraft:300,400,500,700,900' rel='stylesheet' type='text/css'>

        {{-- Favicons --}}
        <link rel="apple-touch-icon" sizes="57x57" href="favicons/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="favicons/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="favicons/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="favicons/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="favicons/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="favicons/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="favicons/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="favicons/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="favicons/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192"  href="favicons/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="favicons/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="favicons/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="favicons/favicon-16x16.png">
        <link rel="manifest" href="favicons/manifest.json">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="favicons/ms-icon-144x144.png">
        <meta name="theme-color" content="#ffffff">
    </head>

    <body ng-app="app">

        <div id="splash" ng-cloak>
            <div id="splash-spinner"></div>
        </div>

        <div ng-cloak style="height: 100%" ng-controller="RootController">
            <div id="main-view" ui-view></div>
        </div>

        <script id="vars">
            var vars = {
                user: '{!! $user !!}',
                baseUrl: '{{ $baseUrl  }}',
                selectedLocale: '{{ Config::get('app.locale') }}',
                trans: {!! $translations !!},
                settings: {!! json_encode($settings->getAll()) !!},
                isDemo: '{{ $isDemo  }}',
                version: '{{ $version }}',
            }
        </script>

        <script src="{{ asset('assets/js/core.min.js?v31') }}"></script>

        @if (($locale = $settings->get('dateLocale', 'en')) && $locale !== 'en')
            <script src="{{ asset('assets/js/locales/'.$locale.'.js')  }}"></script>
        @endif

        @if ($code = $settings->get('analytics'))
            <script>
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

                ga('create', '{{ $settings->get('analytics') }}', 'auto');
                ga('send', 'pageview');
            </script>
        @endif
    </body>
</html>
