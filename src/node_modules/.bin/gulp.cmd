@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\_gulp@3.9.1@gulp\bin\gulp.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\_gulp@3.9.1@gulp\bin\gulp.js" %*
)