const orgService = require('./org.service');

async function getCurrentOrganization(req, res, next) {
  try {
    const org = await orgService.getOrganizationById(req.user.organizationId);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    return res.json(org);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getCurrentOrganization };
