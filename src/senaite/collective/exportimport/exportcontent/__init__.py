from collective.exportimport.export_content import ExportContent

class CollectiveExportContent(ExportContent):

    """
    QUERY = {
        'Document': {'review_state': ['published', 'pending']},
    }
    """
    QUERY = {}

    """
    DROP_PATHS = [
        '/Plone/userportal',
        '/Plone/en/obsolete_content',
    ]
    """
    DROP_PATHS = []

    """
    DROP_UIDS = [
        '71e3e0a6f06942fea36536fbed0f6c42',
    ]
    """
    DROP_UIDS = []

    def update(self):
        """Use this to override stuff before the export starts
        (e.g. force a specific language in the request)."""

    def start(self):
        """Hook to do something before export."""

    def finish(self):
        """Hook to do something after export."""

    def global_obj_hook(self, obj):
        """Inspect the content item before serialisation data.
        Bad: Changing the content-item is a horrible idea.
        Good: Return None if you want to skip this particular object.
        """
        return obj

    def global_dict_hook(self, item, obj):
        """Use this to modify or skip the serialized data.
        Return None if you want to skip this particular object.
        """
        return item

    def dict_hook_document(self, item, obj):
        """Use this to modify or skip the serialized data by type.
        Return the modified dict (item) or None if you want to skip this particular object.
        """
        return item