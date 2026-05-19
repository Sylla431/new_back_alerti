var supabaseConfig = require('../config/supabase');

function getClient() {
  return supabaseConfig.getSupabaseClient();
}

async function selectAll(tableName) {
  var response = await getClient().from(tableName).select('*');

  if (response.error) {
    throw response.error;
  }

  return response.data || [];
}

module.exports = {
  getClient: getClient,
  selectAll: selectAll
};
