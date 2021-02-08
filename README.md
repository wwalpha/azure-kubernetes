# azure-kubernetes

## Create Resources

```
# create new namespace
kubectl create namespace onecloud

# set default namespace
kubectl config set-context --current --namespace=onecloud

# add acr secret
kubectl create secret docker-registry acr-auth --docker-server ocaks.azurecr.io --docke--username ocaks --docker-password 13cBSNXHec8Sbt52qxxPASSWORD --docker-email kkk@kkk.com

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
# create 'kubectl' alias
alias k='kubectl'

k get pods
```
