var supabaseService = require('./supabaseService');

async function getConseilsParType(type) {
  var response = await supabaseService
    .getClient()
    .from('conseil')
    .select('*')
    .eq('type', type);

  if (response.error) {
    throw response.error;
  }

  return response.data || [];
}

async function ajouterConseil(conseil) {
  var response = await supabaseService
    .getClient()
    .from('conseil')
    .insert({
      type: conseil.type,
      description: conseil.description
    })
    .select();

  if (response.error) {
    throw response.error;
  }

  return response.data || [];
}

module.exports = {
  getConseilsParType: getConseilsParType,
  ajouterConseil: ajouterConseil
};
