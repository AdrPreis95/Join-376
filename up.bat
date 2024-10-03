:: How to use e.g. command line > up.bat button added
:: The text after up.bat will be attached as commit description

git pull
git add .
git commit -m "%*"
git push