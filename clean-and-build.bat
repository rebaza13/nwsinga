@echo off
echo Cleaning Android build...
cd src-capacitor\android
call gradlew.bat clean
cd ..\..
echo Building Android app...
call quasar build -m capacitor -T android
