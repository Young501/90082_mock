export const formatDate = (dateString: string ) => {
    if (!dateString) return "No date available";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };