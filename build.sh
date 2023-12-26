set -e
buildout
printf "\neffective-user senaite" >> parts/instance/etc/zope.conf
