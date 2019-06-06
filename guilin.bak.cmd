@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\guilin\bin\guilin" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\guilin\bin\guilin" %*
)