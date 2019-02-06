
The goal of this workshop is to engage in hands-on exploration of docker. Several docker-related concepts and tasks are investigated. The workshop will focus on using docker to build a simple CI server.

## Preqs

You will need a computing environment with docker. You can follow the [computing environments workshop](https://github.com/chrisparnin/ComputingEnvironmentsWorkshop) if you have not setup a virtual environment/vagrant yet.

#### Option 1: Using baker

Create a baker.yml file and run `baker bake`

```
name: docker-build
vm:
  ip: 192.168.28.28
lang: 
  - nodejs9
services:
  - docker
```

#### Option 2: Manual installation

. The recommended method for installing docker on ubuntu can be [found here](https://docs.docker.com/install/linux/docker-ee/ubuntu/#install-docker-ee-1).  But in the interest of time: :grimacing: :

```
curl -sSL https://get.docker.com/ | sh
```

After installation, it is recommended you allow docker to be run without needing sudo. **IMPORTANT** You'd need to restart your shell (exit and log back in) to see the changes reflected.

```
sudo usermod -aG docker $(whoami)
```

Verify you can run docker:
```
docker run hello-world
```

## Concepts

![image](https://cloud.githubusercontent.com/assets/742934/12471344/bc02d41e-bfca-11e5-9631-62e485b9851e.png)

* A docker image contains a set of layers which describe stateful changes to the environment.
* An image can be based on other base images.
* A container is an instance of image.
* Containers are generally *stateless*, that is any change to a container has no effect on its image; however, you can commit a change to a new image.
* **A docker container only stays alive as long as there is an active process being run in it.**

We'll explore some of these concepts below.

## Build: 

### Creating docker image

Build a docker environment for running build.  Create a "Dockerfile" and place this content inside:

	FROM ubuntu:15.04
	MAINTAINER Chris Parnin, chris.parnin@ncsu.edu

	RUN apt-get -y update
	
	# update packages and install
	RUN apt-get install -y wget openjdk-8-jdk curl unzip
	
	RUN apt-get -y install git
	RUN apt-get -y install maven
	RUN apt-get -y install libblas*
	RUN ldconfig /usr/local/cuda/lib64
	
	ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64

Build the docker image

    sudo docker build -t ncsu/buildserver .
    
See what images are current available on the machine.

    sudo docker images

Verify image works and can run a maven command.

    sudo docker run -it ncsu/buildserver mvn --version

### Playing around in Docker

Run an interactive terminal.

    sudo docker run -it ncsu/buildserver

Inside docker

    ls
    rm -rf --no-preserve-root /
    exit
    
Check if its still there.

    sudo docker run -it ncsu/buildserver

##### Containers

Look at all the containers you've created by running commands above.

    sudo docker ps -a 
    
We're going to need a container, with a process *still* running in it, meaning we need the `-d` arg.

    sudo docker run -it -d ncsu/buildserver

This will show you last container id created.    

    sudo docker ps -l

Let's take last container, and update it.

    sudo docker exec -it 674183b76a10 script /dev/null -c "echo 'Hello' > foo.txt"

Make sure we can see change:

    docker exec -it 674183b76a10 ls

Now, let's commit this to our image.

    docker commit 674183b76a10 ncsu/buildserver

**Now, any new container created from this image will have the new chanage.**

### Building

In your host VM, create 'build.sh' and place the following inside: 

    git clone https://github.com/CSC-326/JSPDemo
    cd JSPDemo
    mvn compile -DskipTests -Dmaven.javadoc.skip=true

Execute script

    chmod +x build.sh
    sudo docker run -v /home/<username>/:/vol ncsu/buildserver sh -c /vol/build.sh

Success!

```
[INFO] Changes detected - recompiling the module!
[INFO] Compiling 5 source files to /JSPDemo/target/classes
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 24.570s
[INFO] Finished at: Mon Mar 14 22:34:35 UTC 2016
[INFO] Final Memory: 12M/30M
[INFO] ------------------------------------------------------------------------
```

### Server

Let's create a simple server to trigger a build server. 

> Note: If you did not use baker to create your VM, you'll have to manually install node.js on your VM.


#### Simple http server in node

```
git clone https://github.com/CSC-DevOps/BuildServerApp.git
```

Extend server.js to run a build when a http request is made.

```
var exec = require('child_process').exec;
var cmd = 'YOUR docker command';
```

Run `node server.js` when you're ready.

#### Test

* Find the ip of your host VM (`ifconfig`).
* In your browser, visit `http://192.168.28.28:8080`, and trigger a build.
* You will see the results eventually stream over to the webpage.
