<?php
/**
 * Front Controller — Point d'entrée unique de l'application
 * 
 * Architecture MVC :
 *   config/database.php        → Connexion MySQL (singleton)
 *   models/User.php            → Modèle (requêtes SQL)
 *   controllers/UserController → Contrôleur (logique métier)
 *   views/users/index.php      → Vue (HTML)
 *   assets/css/ & assets/js/   → Ressources statiques
 */

require_once __DIR__ . '/controllers/UserController.php';

$controller = new UserController();

// Routage simple : si ?action=api → traiter la requête API, sinon → afficher la vue
if (isset($_GET['action']) && $_GET['action'] === 'api') {
    $controller->handleRequest();
} else {
    $controller->showView();
}
