/* eslint-disable camelcase */

const mapDBToModel = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year,
  coverUrl: cover,
});

module.exports = mapDBToModel;
