async function getTokens(id) {
  const tokens = await fetch(`/tokens/${id}`);
  const parsed = await tokens.json();
  return parsed;
}

async function main() {
  const id = document.location.pathname.split('shared/')[1];
  const { accessToken, refreshToken } = await getTokens(id);
  const currentURL = window.location.origin.split('/')[0];
  window.location.replace(`${currentURL}/profile?accessToken=${accessToken}&refreshToken=${refreshToken}`);
}

main();
