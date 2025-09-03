#!/bin/bash -

#=-= START OF CUSTOM SERVICE CONFIGURATION =-#
# Where micro service parent folder sits?
MS_HOME=/home/apps/frontend_met # <--- EDIT THIS LINE

# Which username we should run as.
RUNASUSER=apps; # <-- EDIT THIS LINE, 

SHUTDOWN_WAIT=20; # before issuing kill -9 on process.

# These options are used when micro service is starting 
OPTIONS="
--path dist/demo1/
-p 4300
";
#=-= END OF CUSTOM CONFIGURATION =-=#

# Try to get PID of spring jar/war
MS_PID=`ps fax|grep node|grep demo1|awk '{print $1}'`
export MS_PID;

# Function: run_as
run_as() {
    local iam iwant;

    iam=$(id -nu);
    iwant="$1";
    shift;

    if [ "${iam}" = "${iwant}" ]; then {
    eval $*;
    }
    else {
    /bin/su -p -s /bin/sh ${iwant} $*;
    } fi;
}

# Function: start
start() {
  pid=${MS_PID}
  if [ -n "${pid}" ]; then {
    echo "Micro service is already running (pid: ${pid})";
  }
  else {
    # Start screener ms
    echo "Starting micro service";
    cd $MS_HOME
    run_as ${RUNASUSER} angular-http-server ${OPTIONS} &
    #run_as ${RUNASUSER} angular-http-server --path dist/ &
  } fi;
  # return 0;
}

# Function: stop
stop() {
  pid=${MS_PID}
  if [ -n "${pid}" ]; then {

    run_as ${RUNASUSER} kill -TERM $pid

    echo -ne "Stopping micro service module";

    kwait=${SHUTDOWN_WAIT};

    count=0;
    while kill -0 ${pid} 2>/dev/null && [ ${count} -le ${kwait} ]; do {
      printf ".";
      sleep 1;
      (( count++ ));
    } done;

    echo;

    if [ ${count} -gt ${kwait} ]; then {
      printf "process is still running after %d seconds, killing process" \
    ${SHUTDOWN_WAIT};
      kill ${pid};
      sleep 3;

      # if it's still running use kill -9
      #
      if kill -0 ${pid} 2>/dev/null; then {
        echo "process is still running, using kill -9";
        kill -9 ${pid}
        sleep 3;
      } fi;
    } fi;

    if kill -0 ${pid} 2>/dev/null; then {
      echo "process is still running, I give up";
    } 
    else {
      echo "nop";
      # success, delete PID file, if you have used it with spring boot
      # rm -f ${SPRING_BOOT_APP_PID};
    } fi;
  } 
  else {
      echo "Micro service is not running";
  } fi;

  #return 0;
}

# Main Code

case $1 in
  start)
    start;
    ;;
  stop)
    stop;
    ;;
  restart)
    stop;
    sleep 1;
    start;
    ;;
  status)
    pid=$MS_PID
    if [ "${pid}" ]; then {
      echo "Micro service module is running with pid: ${pid}";
    }
    else {
      echo "Micro service module is not running";
    } fi;
    ;;
esac

exit 0;
