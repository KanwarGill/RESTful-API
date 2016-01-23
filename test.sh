#!/bin/sh

function check {
     if [ $? -ne 0 ] ; then
         echo "Error occurred getting URL $1:"
         if [ $? -eq 6 ]; then
             echo "Unable to resolve host"
         fi
         if [$? -eq 7 ]; then
             echo "Unable to connect to host"
         fi
         exit 1
	 else
		echo "Good to go!"
     fi


}
echo "Enter the hostname"
read host
echo "Enter the port number"
read port
server="$host:$port"
echo "Checking $server"
curl -s -o "/dev/null" $server
check;
echo "Checking tweets"
curl -s -o "/dev/null" "$server/api/tweets"
check;
echo "Checking users"
curl -s -o "/dev/null" "$server/api/users"
check;
echo "Checking external links"
curl -s -o "/dev/null" "$server/api/extlinks"
check;
echo "Checking location"
curl -s -o "/dev/null" "$server/api/location"
check;

