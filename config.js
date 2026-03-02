// GadgetHQ Configuration
const CONFIG = {
    // Serverless API Endpoints
    API: {
        GET_GADGETS: '/.netlify/functions/get-gadgets',
        CREATE_GADGET: '/.netlify/functions/create-gadget',
        UPDATE_GADGET: '/.netlify/functions/update-gadget',
        DELETE_GADGET: '/.netlify/functions/delete-gadget',
        UPLOAD_IMAGE: '/.netlify/functions/upload-image',
    },

    // Airtable details for fallback/reference (IDs are safe, keys are not)
    AIRTABLE_BASE_ID: 'appGZk4jo6hGXDK4V',
    AIRTABLE_TABLE_NAME: 'Gadgets'
};
