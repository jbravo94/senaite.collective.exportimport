set -e
buildout
printf "\neffective-user senaite" >> parts/instance/etc/zope.conf
chmod -R 777 var
chmod -R 777 eggs
