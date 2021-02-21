# azure-kubernetes

## Installing Helm

```sh
curl https://baltocdn.com/helm/signing.asc | sudo apt-key add -
sudo apt-get install apt-transport-https --yes
echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```

## Installing Istio

```sh
# Download the Istio release
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.8.3

# Create a namespace istio-system for Istio components
kubectl create namespace istio-system

# Install the Istio base chart which contains cluster-wide resources used by the Istio control plane
helm install -n istio-system istio-base manifests/charts/base

# Install the Istio discovery chart which deploys the istiod service
helm install --namespace istio-system istiod manifests/charts/istio-control/istio-discovery \
    --set global.hub="docker.io/istio" --set global.tag="1.8.3"

# Verifying the installation
kubectl get pods -n istio-system
```

## Installing Ingress Controller

```
# Create a namespace for your ingress resources
# kubectl create namespace ingress-basic

# Add the ingress-nginx repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

# Use Helm to deploy an NGINX ingress controller
helm install nginx-ingress ingress-nginx/ingress-nginx \
    --namespace default \
    --set controller.replicaCount=1 \
    --set controller.nodeSelector."beta\.kubernetes\.io/os"=linux \
    --set defaultBackend.nodeSelector."beta\.kubernetes\.io/os"=linux \
    --set controller.admissionWebhooks.patch.nodeSelector."beta\.kubernetes\.io/os"=linux
```

## Docker build and push

```
export ACR=ocaks

docker build -t k8s-frontend .
docker tag k8s-frontend:latest $ACR.azurecr.io/k8s/frontend:latest

az acr login --name $ACR
docker push $ACR.azurecr.io/k8s/frontend:latest
```

## Create Resources

```
export ACR_REPO=ocaks.azurecr.io
export AKS_NAMESPACE=onecloud
export DOCKER_PASSWORD=password
export DOCKER_EMAIL=kkk@kkk.com

# create new namespace
kubectl create namespace $NAMESPACE

# set default namespace
kubectl config set-context --current --namespace=$NAMESPACE

# add acr secret
kubectl create secret docker-registry acr-auth --docker-server $ACR_REPO --docker-username ocaks --docker-password $DOCKER_PASSWORD --docker-email $DOCKER_EMAIL

# create frontend deployment
kubectl apply -f frontend/deployment.yml

# create frontend service
kubectl apply -f frontend/service.yml

```

## Trouble Shooting

```
# get all events
kubectl get events --all-namespaces

# get pods list
kubectl get pods

# get logs
kubectl logs xxx-pod

# describe pod event
kubectl describe xxx-pod
```

## Tips

```
export RESOURCE_GROUP=RG-AKS
export CLUSTER_NAME=onecloud-aks

# get credential
az aks get-credentials --name $CLUSTER_NAME --resource-group $RESOURCE_GROUP

# create 'kubectl' alias
alias k='kubectl'

k get pods
```
