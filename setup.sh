#!/bin/bash
echo "Initialization environment..."
if [ ! -d "tools" ]; then
	if [ ! -f "tools.zip" ]; then
		echo "Download tools... (~35 MB) Please wait..."
		if [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
			wget "https://irinyi.cloud/varosifak/tools.zip"
		elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
			powershell -Command "Invoke-WebRequest https://irinyi.cloud/varosifak/tools.zip -OutFile tools.zip"
		elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
			powershell -Command "Invoke-WebRequest https://irinyi.cloud/varosifak/tools.zip -OutFile tools.zip"
		fi
		echo "tools.zip downloaded"
	else
		echo "tools.zip is exists."
	fi
	unzip tools.zip -d tools
	echo "Unzip is done..."
fi
if ! type node > /dev/null; then
  echo "Node is not found..."
  echo "Please download from https://nodejs.org/"
  read bye
  exit
fi

if ! type cordova > /dev/null; then
  echo "Installing Cordova... Please wait..."
  npm install -g cordova
  echo "Install was successful."
  echo "Please restart the setup.sh script"
  read bye
  exit
fi

echo "What do you want?"
echo "emulate - run android"
echo "debugon - run in browser"
echo "debugoff - remove browser mode"
echo "release - release a signed android version"
read proctype

if [ "$proctype" == "emulate" ]; then
	# Run in connected or emulated Android device
	for i in `cat plugins-list.dat | grep '^[^ ]*' -o`; do cordova plugin add $i; done
	cordova platform add android
	cordova run android
elif [ "$proctype" == "debugon" ]; then
	# Run in browser to debugging (console)
	for i in `cat plugins-list.dat | grep '^[^ ]*' -o`; do cordova plugin add $i; done
	cordova platform add browser
	echo "You can use \"cordova run browser\" command in folder to start application as debug mode in browser."
	echo "If you're done, please run again the script with 'debugoff' parameter. Thank you."
	if [ -z $1 ]; then
		read bye
	fi
	cordova run browser
	exit 1
elif [ "$proctype" == "debugoff" ]; then
	echo "To turn off the debug mode require the clean workplace."
elif [ "$proctype" == "release" ]; then
	# Create a Release version
	if [ -f android.apk ]; then
		rm android.apk
	fi
	for i in `cat plugins-list.dat | grep '^[^ ]*' -o`; do cordova plugin add $i; done
	cordova platform add android
	cordova build --release android
	echo "Now it comes the signaturing..."
	echo "The default user and password: test/test"
	read -p "Signer name: " suname
	read -s -p "Password: " spass
	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore varosifak.keystore -storepass varosifak -keypass ${spass} platforms/android/build/outputs/apk/android-release-unsigned.apk ${suname}

	if [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
		./tools/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk android.apk
	elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
		./tools/zipalign.exe -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk android.apk
	elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
		./tools/zipalign.exe -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk android.apk
	fi
fi
if [ -z $1 ]; then
	echo "Do you want clean the workplace? (y/n)"
	read clean
	if [ "$clean" == "y" ] || [ "$clean" == "Y" ]; then
		cordova platform rm android
		cordova platform rm browser
		for i in `cordova plugin ls | grep '^[^ ]*' -o`; do cordova plugin rm --force $i; done
	fi
	echo "Done."
	read bye
fi
