// Adaugă un toggle pentru adresa implicită
const toggleDefaultAddress = async (addressId) => {
  try {
    // Mai întâi, resetează toate adresele ca neimplicite
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
    
    // Apoi, setează adresa selectată ca implicită
    const { error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
    
    if (error) throw error
    
    // Reîncarcă adresele
    loadAddresses()
    
    showToast('Adresa implicită a fost actualizată', 'success')
  } catch (error) {
    console.error('Error setting default address:', error)
    showToast('Eroare la actualizarea adresei implicite', 'error')
  }
} 