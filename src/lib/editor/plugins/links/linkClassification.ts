export type LinkType = 
    | 'contact'
    | 'contact-missing'
    | 'task'
    | 'task-missing'
    | 'internal-file'
    | 'internal-folder'
    | 'internal-missing'
    | 'external'
    | 'mail'
    | 'default'
    | 'arxiv'
    | 'wiki';

export function classifyLink(link: string | null): LinkType { 
    if (!link) {
        return 'default';
    }

    if (link.startsWith('mailto:')) {
        return 'mail';
    }

    if (link.startsWith('http')) {
        if (link.includes('arxiv.org/abs/')) {
            return 'arxiv';
        }
        if (link.includes('wikipedia.org/wiki/')) {
            return 'wiki';
        }
        return 'external';
    }

    if (link.startsWith('/tasks/')) {
        if (link.endsWith('/?')) {
            return 'task-missing';
        }
        return 'task';
    }

    if (link.startsWith('/contacts/')) {
        if (link.endsWith('/?')) {
            return 'contact-missing';
        }
        return 'contact';
    }

    if (link.startsWith('mailto:')) {
        return 'mail';
    }

    if (link.endsWith('?')) {
        return 'internal-missing';
    }
    if (link.endsWith('/')) {
        return 'internal-folder';
    }
    return 'internal-file';
}

export const linkTypeStyles = {
    'task': { color: '#8b5cf6', icon: '📄', description: 'Task File' },
    'task-missing': { color: '#8b5cf6', icon: '❓', description: 'Missing Task' },
    'contact-file': { color: '#3b82f6', icon: '👤', description: 'Contact' },
    'contact-missing': { color: '#3b82f6', icon: '❓', description: 'Missing Contact' },
    'internal-file': { color: '#6b7280', icon: '📄', description: 'Internal Page' },
    'internal-folder': { color: '#6b7280', icon: '📁', description: 'Internal Folder' },
    'internal-missing': { color: '#6b7280', icon: '❓', description: 'Missing Page' },
    'external': { color: '#ef4444', icon: '🌐', description: 'External Link' },
    'email': { color: '#10b981', icon: '✉️', description: 'Email' },
    'default': { color: 'inherit', icon: '🔗', description: 'Link' }
  } as const