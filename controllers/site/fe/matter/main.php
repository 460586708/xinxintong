<?php
namespace site\fe\matter;

require_once dirname(dirname(__FILE__)) . '/base.php';
/**
 * 返回访问的素材页面
 */
class main extends \site\fe\base {

	public function get_access_rule() {
		$rule_action['rule_type'] = 'black';
		$rule_action['actions'] = array();

		return $rule_action;
	}
	/**
	 * @param string $id
	 * @param string $type
	 * @param string $shareby
	 */
	public function index_action($site, $id, $type, $shareby = '') {
		/* 返回页面 */
		switch ($type) {
		case 'article':
		case 'custom':
			$modelArticle = $this->model('matter\article');
			$article = $modelArticle->byId($id, 'title');
			\TPL::assign('title', $article->title);
			if ($type === 'article') {
				\TPL::output('site/fe/matter/article/main');
			} else {
				\TPL::output('site/fe/matter/custom/main');
			}
			break;
		case 'news':
			\TPL::output('site/fe/matter/news/main');
			break;
		case 'channel':
			\TPL::output('site/fe/matter/channel/main');
			break;
		}
		exit;
	}
}