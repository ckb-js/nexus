export type Site = {
  name: string;
  url: string;
};

const siteService = {
  sites: [
    {
      name: 'Google',
      url: 'https://www.google.com',
    },
    {
      name: 'Github',
      url: 'https://www.github.com',
    },
  ],
  async getWhitelistSites(): Promise<Site[]> {
    return this.sites;
  },

  async removeSites(_site: Site): Promise<void> {
    this.sites = this.sites.filter((site) => site.url !== _site.url);
  },
};

export default siteService;
