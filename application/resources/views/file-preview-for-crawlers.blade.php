@if ($model->getMimeType() === 'audio')
    <audio controls>
        <source src="{{ $model->absoluteUrl }}" type="{{ $model->mime  }}">
    </audio>
@elseif ($model->getMimeType() === 'image')
    <img src="{{ $model->absoluteUrl  }}" alt="{{ $model->name }}"/>
@elseif ($model->getMimeType() === 'video')
    <video width="320" height="240" controls>
        <source src="{{ $model->absoluteUrl }}" type="{{ $model->mime }}">
    </video>
@else
    <iframe src="{{ $model->absoluteUrl  }}" frameborder="0"></iframe>
@endif