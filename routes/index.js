
/*
 * GET home page.
 */

/*exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};*/

exports.index = function(req, res){
  res.render('../public/index.html');
};