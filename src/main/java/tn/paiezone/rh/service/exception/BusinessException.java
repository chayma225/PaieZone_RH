package tn.paiezone.rh.service.exception;

public class BusinessException extends RuntimeException {

    private final String entity;
    private final String errorKey;

    // ✅ constructeur simple (recommandé)
    public BusinessException(String message) {
        super(message);
        this.entity = null;
        this.errorKey = null;
    }

    // ✅ constructeur complet
    public BusinessException(String message, String entity, String errorKey) {
        super(message);
        this.entity = entity;
        this.errorKey = errorKey;
    }

    public String getEntity() {
        return entity;
    }

    public String getErrorKey() {
        return errorKey;
    }
}
