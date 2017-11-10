@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\..\..\_miller-rabin@4.0.1@miller-rabin\bin\miller-rabin" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\..\..\_miller-rabin@4.0.1@miller-rabin\bin\miller-rabin" %*
)