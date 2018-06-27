<html ng-app="installer">
	<head>
		<title>BeDrive - Installation</title>

		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

		<link rel="stylesheet" href="{{ asset('assets/css/styles.min.css?v1') }}">
        <link href='http://fonts.googleapis.com/css?family=RobotoDraft:300,400,500,700,900' rel='stylesheet' type='text/css'>
	</head>

	<body id="install" ng-controller="InstallController">

		<div class="container cont-pad-bottom" id="content">
			
			<div class="row logo"><img class="img-responsive" src="{{ asset('assets/images/logo_dark.png')  }}" alt="logo"></div>
			<hr>

			<section class="row">
				<ul class="wizard list-unstyled clearfix">
					<li ng-class="{ active: currentStep === 'compatability'}" class="compat"><span class="step">1</span> <span class="title">Compatability</span></li>
					<li ng-class="{ active: currentStep === 'database'}" class="db"><span class="step">2</span> <span class="title">Database</span></li>
					<li ng-class="{ active: currentStep === 'admin'}" class="config"><span class="step">3</span> <span class="title">Admin Account</span></li>
				</ul>
				<div class="clearfix"></div>
			</section>

			<section ui-view></section>

		</div>

		<div id="loader"><md-progress-circular md-mode="indeterminate"></md-progress-circular></div>

        <script src="{{ asset('assets/js/install.min.js') }}"></script>
	</body>
</html>
	

