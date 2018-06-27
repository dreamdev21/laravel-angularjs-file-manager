<!DOCTYPE html>
<html>

    <head>
        <title>{{ trans('app.resetPasswordTitle')  }}</title>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="{{ asset('assets/css/styles.min.css') }}">
        <link href='http://fonts.googleapis.com/css?family=RobotoDraft:300,400,500,700,900' rel='stylesheet' type='text/css'>
    </head>

    <body id="reset-password-page">
        <div class="reset-container">
            <div class="panel panel-default">
                <div class="panel-heading">{{ trans('app.resetPassword')  }}</div>
                <div class="panel-body">
                    @if (count($errors) > 0)
                        <div class="alert alert-danger">
                            <strong>Whoops!</strong> <span>{{ trans('app.resetErrors')  }}</span><br><br>
                            <ul>
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form class="form-horizontal" role="form" method="POST" action="{{ url('/password/reset') }}">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="token" value="{{ $token }}">

                        <div class="form-group">
                            <label class="col-md-4 control-label">{{ trans('app.emailAddress')  }}</label>
                            <div class="col-md-6">
                                <input type="email" class="form-control" name="email" value="{{ old('email') }}">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-md-4 control-label">{{ trans('app.newPassword')  }}</label>
                            <div class="col-md-6">
                                <input type="password" class="form-control" name="password">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-md-4 control-label">{{ trans('app.confirmPassword')  }}</label>
                            <div class="col-md-6">
                                <input type="password" class="form-control" name="password_confirmation">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-6 col-md-offset-4">
                                <button type="submit" class="btn btn-primary">
                                    {{ trans('app.resetPassword')  }}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </body>
</html>