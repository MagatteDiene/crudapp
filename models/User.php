<?php

require_once __DIR__ . '/../config/database.php';

class User
{
    private $pdo;
    private $table = 'utilisateurs';

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    /**
     * Récupérer tous les utilisateurs
     */
    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT id, nom, prenom, login, created_at FROM {$this->table} ORDER BY id DESC");
        return $stmt->fetchAll();
    }

    /**
     * Récupérer un utilisateur par ID
     */
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT id, nom, prenom, login, created_at FROM {$this->table} WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Vérifier si un login existe déjà
     */
    public function loginExists($login, $excludeId = null)
    {
        if ($excludeId) {
            $stmt = $this->pdo->prepare("SELECT id FROM {$this->table} WHERE login = :login AND id != :id");
            $stmt->execute([':login' => $login, ':id' => $excludeId]);
        } else {
            $stmt = $this->pdo->prepare("SELECT id FROM {$this->table} WHERE login = :login");
            $stmt->execute([':login' => $login]);
        }
        return $stmt->fetch() !== false;
    }

    /**
     * Créer un utilisateur
     */
    public function create($data)
    {
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (nom, prenom, login, password) VALUES (:nom, :prenom, :login, :password)");
        $stmt->execute([
            ':nom'      => $data['nom'],
            ':prenom'   => $data['prenom'],
            ':login'    => $data['login'],
            ':password' => $hashedPassword
        ]);
        return $this->pdo->lastInsertId();
    }

    /**
     * Modifier un utilisateur
     */
    public function update($data)
    {
        if (!empty($data['password'])) {
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $this->pdo->prepare("UPDATE {$this->table} SET nom = :nom, prenom = :prenom, login = :login, password = :password WHERE id = :id");
            $stmt->execute([
                ':nom'      => $data['nom'],
                ':prenom'   => $data['prenom'],
                ':login'    => $data['login'],
                ':password' => $hashedPassword,
                ':id'       => $data['id']
            ]);
        } else {
            $stmt = $this->pdo->prepare("UPDATE {$this->table} SET nom = :nom, prenom = :prenom, login = :login WHERE id = :id");
            $stmt->execute([
                ':nom'    => $data['nom'],
                ':prenom' => $data['prenom'],
                ':login'  => $data['login'],
                ':id'     => $data['id']
            ]);
        }
        return $stmt->rowCount();
    }

    /**
     * Supprimer un utilisateur
     */
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount();
    }
}
