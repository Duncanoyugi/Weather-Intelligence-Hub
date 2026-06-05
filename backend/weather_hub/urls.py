from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
]

# Only include API routes if api app exists
try:
    from api.urls import urlpatterns as api_urlpatterns
    urlpatterns += [
        path('api/', include('api.urls')),
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    ]
except ImportError:
    # api app not created yet — that's fine during initial setup
    pass