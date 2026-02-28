<?php

require_once __DIR__ . '/../models/User.php';

class UserController
{
    private $userModel;
    private $requestData;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * Dispatcher les requêtes API selon la méthode HTTP
     */
    public function handleRequest()
    {
        header('Content-Type: application/json; charset=utf-8');

        $method = $_SERVER['REQUEST_METHOD'];

        // Lire le body une seule fois et le stocker
        $this->requestData = json_decode(file_get_contents('php://input'), true);

        // Support de _method override pour DELETE et PUT via POST
        if ($method === 'POST' && isset($this->requestData['_method'])) {
            $method = strtoupper($this->requestData['_method']);
        }

        switch ($method) {
            case 'GET':
                $this->index();
                break;
            case 'POST':
                $this->store();
                break;
            case 'PUT':
                $this->update();
                break;
            case 'DELETE':
                $this->destroy();
                break;
            default:
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Méthode non autorisée.']);
        }
    }

    /**
     * GET — Lister tous les utilisateurs
     */
    private function index()
    {
        try {
            $utilisateurs = $this->userModel->getAll();
            echo json_encode(['success' => true, 'data' => $utilisateurs]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    /**
     * POST — Inscrire un utilisateur
     */
    private function store()
    {
        $data = $this->requestData;

        // Validation
        if (empty($data['nom']) || empty($data['prenom']) || empty($data['login']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Tous les champs sont obligatoires.']);
            return;
        }

        try {
            // Vérifier unicité du login
            if ($this->userModel->loginExists($data['login'])) {
                http_response_code(409);
                echo json_encode(['success' => false, 'error' => 'Ce login est déjà utilisé.']);
                return;
            }

            $id = $this->userModel->create($data);
            echo json_encode(['success' => true, 'message' => 'Utilisateur créé avec succès.', 'id' => $id]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    /**
     * PUT — Modifier un utilisateur
     */
    private function update()
    {
        $data = $this->requestData;

        // Validation
        if (empty($data['id']) || empty($data['nom']) || empty($data['prenom']) || empty($data['login'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Les champs id, nom, prenom et login sont obligatoires.']);
            return;
        }

        try {
            // Vérifier unicité du login (hors utilisateur courant)
            if ($this->userModel->loginExists($data['login'], $data['id'])) {
                http_response_code(409);
                echo json_encode(['success' => false, 'error' => 'Ce login est déjà utilisé par un autre utilisateur.']);
                return;
            }

            $this->userModel->update($data);
            echo json_encode(['success' => true, 'message' => 'Utilisateur modifié avec succès.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    /**
     * DELETE — Supprimer un utilisateur
     */
    private function destroy()
    {
        $data = $this->requestData;

        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => "L'ID de l'utilisateur est obligatoire."]);
            return;
        }

        try {
            $rowCount = $this->userModel->delete($data['id']);

            if ($rowCount > 0) {
                echo json_encode(['success' => true, 'message' => 'Utilisateur supprimé avec succès.']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Utilisateur non trouvé.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Afficher la vue principale
     */
    public function showView()
    {
        require_once __DIR__ . '/../views/users/index.php';
    }
}
