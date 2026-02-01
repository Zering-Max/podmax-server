# Back-end du projet "Podmax"

## Introduction

Partie back-end de l'appli mobile de podcasts fait en NodeJS + Typescript et déployé sur Render, on utilise une base de données type MongoDB du fait du caractère non-structurée de certaines données (par exemple les audios et les playlists).

## Organisation du code

à partir du ficher racine `index.ts` du dossier `src` on récupère nos routeurs pour tous les chemins urls d'API (dossier `routers`).

Dans chaque routeur on a toutes les requêtes de type CRUD (Create POST, Read GET, Update PATCH, Delete DELETE). 

Certains chemins url des routeurs ont, avant d'appeler un contrôleur (dossier `controllers` qui comprend les différents services créés comme "créer un user, modifier une playlist", etc.), appellent ce qu'on nomme un `middleware`. C'est un service "intermédiaire" ("logiciel du milieu" si on devait traduire littéralement) qui permet notamment d'effectuer des contrôles specifiques sur certains urls (par exemple vérifier si un user est bien connecté ou vérifié).

La dossier `models`comprend toute la création des tables d'origine de la database et leur signification (voir aussi le diagramme ERP `diagramme_db`en racine du projet).

Le dossier `cloud`comprend les éléments de l'application cloudinary pour stocker les images & audios.

Les dossiers `mail`,`@types`et `utils` comportent respectivement :
- le template des mails que l'on reçoit lors de certains évènements de l'appli (création de compte, vérification de l'utilisateur, etc..) 
- des typages specifiques de variables
- d'autres fonctions utiles annexes

