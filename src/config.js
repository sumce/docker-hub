/**
 * 配置中心
 *
 * 所有可调参数集中在此，方便维护和 review。
 */

export const REGISTRIES = {
  'docker.io': {
    host: 'registry-1.docker.io',
    authHost: 'auth.docker.io',
    authPath: '/token',
    authService: 'registry.docker.io',
    label: 'Docker Hub',
    icon: '🐳',
    home: 'https://hub.docker.com',
  },
  'quay.io': {
    host: 'quay.io',
    label: 'Quay',
    icon: '🔵',
    home: 'https://quay.io',
  },
  'ghcr.io': {
    host: 'ghcr.io',
    label: 'GitHub Container Registry',
    icon: '🐙',
    home: 'https://ghcr.io',
  },
  'gcr.io': {
    host: 'gcr.io',
    label: 'Google Container Registry',
    icon: '☁️',
    home: 'https://gcr.io',
  },
  'k8s.gcr.io': {
    host: 'k8s.gcr.io',
    label: 'Kubernetes GCR',
    icon: '☸️',
    home: 'https://k8s.gcr.io',
  },
  'registry.gitlab.com': {
    host: 'registry.gitlab.com',
    label: 'GitLab Registry',
    icon: '🦊',
    home: 'https://gitlab.com',
  },
};

export const CACHE_TTL = {
  blob: 86400 * 30,       // 层 → 30 天（内容不变）
  tagManifest: 300,        // 标签清单 → 5 分钟（latest 会变）
  digestManifest: 86400,   // 摘要清单 → 1 天
};

export const REGISTRY_ALIASES = Object.keys(REGISTRIES);
export const DEFAULT_REGISTRY = 'docker.io';

// Manifest 媒体类型协商顺序
export const ACCEPT_MANIFEST = [
  'application/vnd.docker.distribution.manifest.v2+json',
  'application/vnd.docker.distribution.manifest.list.v2+json',
  'application/vnd.docker.distribution.manifest.v1+json',
  'application/vnd.oci.image.manifest.v1+json',
  'application/vnd.oci.image.index.v1+json',
  'application/json',
].join(', ');

export const USER_AGENT = 'DockerRegistryProxy/1.0';
