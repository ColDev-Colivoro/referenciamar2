from .services import resolve_tenant
from .tenancy import clear_current_tenant


class TenantContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        clear_current_tenant()
        request.resolved_tenant = resolve_tenant(request)

        try:
            response = self.get_response(request)
        finally:
            clear_current_tenant()

        return response
