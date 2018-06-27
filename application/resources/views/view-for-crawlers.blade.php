<!DOCTYPE html>
<html>

    <head>
        <meta charset="UTF-8">

        <title>{{ $model->name }} - {{ $settings->get('siteName') }}</title>
        <meta name="description" content="{{ $model->description ? $model->description : $settings->get('metaDescription') }}" />

        <meta name="ROBOTS" content="NOINDEX,FOLLOW">
        <meta name="GOOGLEBOT" content="NOINDEX,FOLLOW">
        <meta name="SLURP" content="NOINDEX,FOLLOW">

        <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, post-check=0, pre-check=0">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">

        <!-- Schema.org markup for Google+ -->
        <meta itemprop="name" content="{{ $model->name }}">
        <meta itemprop="description" content="{{ $model->description ? $model->description : $settings->get('metaDescription') }}">
        <meta itemprop="image" content="{{ $model->type === 'file' ? $model->absoluteUrl : $model->files->first()->absoluteUrl  }}">

        <!-- Twitter Card data -->
        <meta name="twitter:card" content="{{ $model->type === 'file' ? 'file' : 'folder'  }}">
        <meta name="twitter:title" content="{{ $model->name }} - {{ $settings->get('siteName') }}">
        <meta name="twitter:description" content="{{ $model->description ? $model->description : $settings->get('metaDescription') }}">
        <meta name="twitter:url" content="{{ Request::fullUrl() }}">
        <meta name="twitter:image" content="{{ $model->type === 'file' ? $model->absoluteUrl : $model->files->first()->absoluteUrl  }}">

        <!-- Open Graph data -->
        <meta property="og:title" content="{{ $model->name }} - {{ $settings->get('siteName') }}" />
        <meta property="og:url" content="{{ Request::fullUrl() }}" />

        @if ($model->type !== 'image')
            <meta property="og:image" content="{{ url('assets/images/file-icons/'.$model->getMimeType().'.png')  }}" />
        @endif

        @if ($model->type === 'folder')
            <?php $item = $model->files->first(); ?>
        @else
            <?php $item = $model; ?>
        @endif

        @if ($item->getMimeType() === 'audio')
            <meta property="og:audio" content="{{ $item->absoluteUrl  }}" />
        @elseif ($item->getMimeType() === 'image')
            <meta property="og:image" content="{{ $item->absoluteUrl  }}" />
        @elseif ($item->getMimeType() === 'video')
            <meta property="og:video" content="{{ $item->absoluteUrl  }}" />
        @endif

        <meta property="og:description" content="{{ $model->description ? $model->description : $settings->get('metaDescription') }}" />
        <meta property="og:site_name" content="{{ $settings->get('siteName') }}" />
    </head>

    <body>
        <h1>{{ $model->name }}</h1>
        <h2>{{ $model->description }}</h2>

        @if($model->type === 'file')
            @include('file-preview-for-crawlers', ['model' => $model])
        @else
            @foreach($model->files as $file)
                @include('file-preview-for-crawlers', ['model' => $file])
            @endforeach
        @endif
    </body>
</html>
