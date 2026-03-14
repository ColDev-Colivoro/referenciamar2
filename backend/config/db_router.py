from apps.core.tenancy import get_current_tenant_db_alias, is_global_model, is_tenant_scoped_model


class MultiTenantRouter:
    def db_for_read(self, model, **hints):
        return self._resolve_database(model, hints)

    def db_for_write(self, model, **hints):
        return self._resolve_database(model, hints)

    def allow_relation(self, obj1, obj2, **hints):
        db_list = {obj1._state.db, obj2._state.db}
        if None in db_list:
            return None
        return len(db_list) == 1

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if model_name is None:
            return None

        label = f"{app_label}.{model_name}".lower()

        if label in {"core.tenantregistry"}:
            return db == "default"

        if label in {"users.role", "users.usermembership", "audit.auditevent"}:
            return db == "default"

        if app_label in {"admin", "auth", "contenttypes", "sessions"}:
            return db == "default"

        return None

    def _resolve_database(self, model, hints):
        if is_global_model(model):
            return "default"

        if is_tenant_scoped_model(model):
            return hints.get("tenant_db_alias") or get_current_tenant_db_alias(strict=bool(hints.get("tenant_strict"))) or "default"

        return None
