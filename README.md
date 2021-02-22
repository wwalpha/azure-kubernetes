# Kubernetes on Azure

## Prerequisite

1. Azure CLI
2. Ubuntu OS
3. Node.js
4. yarn

## Initialize Azure Resources

```sh
export RESOURCE_GROUP=RG_AKS
export AKS_CLUSTER=aks-cluster
export ACR_NAME=k8srepo

# create resource group
az group create --name $RESOURCE_GROUP --location japaneast

# create kubernetes cluster
az aks create --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER --node-count 1 --enable-addons monitoring --generate-ssh-keys

# create container registry
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic

# enable admin access key
az acr update --name $ACR_NAME --admin-enabled true
```

## Initialize Azure Kubernetes Service

```sh
export RESOURCE_GROUP=RG_AKS
export AKS_CLUSTER=aks-cluster
export AKS_NAMESPACE=onecloud
export ACR_NAME=k8srepo
export ACR_REPO=$ACR_NAME.azurecr.io
export ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value)
export ACR_EMAIL=kkk@kkk.com

# install kubectl
az aks install-cli

# get kubernetes credentials
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER

# create new namespace
kubectl create namespace $AKS_NAMESPACE

# set default namespace
kubectl config set-context --current --namespace=$AKS_NAMESPACE

# add acr secret
kubectl create secret docker-registry acr-auth --docker-server $ACR_REPO --docker-username $ACR_NAME --docker-password $ACR_PASSWORD --docker-email $ACR_EMAIL
```

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

```sh
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

```sh
export ACR_NAME=k8srepo

# acr login
az acr login --name $ACR_NAME

# frontend (frontend folder)
docker build -t $ACR_NAME.azurecr.io/k8s/frontend:latest .
docker push $ACR_NAME.azurecr.io/k8s/frontend:latest

# backend-api (backend/api folder)
docker build -t $ACR_NAME.azurecr.io/k8s/backend-api:latest .
docker push $ACR_NAME.azurecr.io/k8s/backend-api:latest

# backend-auth (backend/auth folder)
docker build -t $ACR_NAME.azurecr.io/k8s/backend-auth:latest .
docker push $ACR_NAME.azurecr.io/k8s/backend-auth:latest

# backend-worker (backend/worker folder)
docker build -t $ACR_NAME.azurecr.io/k8s/backend-worker:latest .
docker push $ACR_NAME.azurecr.io/k8s/backend-worker:latest
```

## Deploy Kubernetes Resources

### Apply Ingress Route

```sh
kubectl apply -f manifests/ingress/ingress.yml
```

### Apply Other Resources

```
kubectl apply -f manifests/frontend
kubectl apply -f manifests/backend_api
kubectl apply -f manifests/backend_auth
kubectl apply -f manifests/backend_worker
```

## Trouble Shooting

```sh
# get all events
kubectl get events --all-namespaces

# get pods list
kubectl get pods

# get logs
kubectl logs xxx-pod

# describe pod event
kubectl describe xxx-pod

# confirm service name use temp container
kubectl run --image=centos:6 --restart=Never --rm -i testpod -- dig -x 10.0.98.204
```

## Tips

```sh
export RESOURCE_GROUP=RG_AKS

# create azure credential for github actions
az ad sp create-for-rbac --name "http://k8s" --role contributor --scopes /subscriptions/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX/resourceGroups/$RESOURCE_GROUP --sdk-auth
```
