<?php
namespace coin;
/**
 *
 */
class log_model extends \TMS_MODEL {
	/**
	 *
	 * @param string $mpid
	 * @param string $act
	 * @param string $from payer
	 * @param string $openid payee
	 */
	public function record($mpid, $act, $objId, $from, $openid) {
		$coin = 0;
		if (empty($mpid) || empty($act) || empty($openid) || empty($from)) {
			return $coin;
		}
		if ($rule = \TMS_APP::model('coin\rule')->byMpid($mpid, $act, $objId)) {
			if ((int) $rule->delta > 0) {
				$current = time();
				$fan = \TMS_APP::model('user/fans')->byOpenid($mpid, $openid, 'nickname,coin,coin_last_at,coin_day,coin_week,coin_month,coin_year');
				$coin = (int) $rule->delta;
				/*更新总值*/
				$total = (int) $fan->coin + $coin;
				/*记录日志*/
				$i['mpid'] = $mpid;
				$i['occur_at'] = $current;
				$i['act'] = $act;
				$i['payer'] = $from;
				$i['payee'] = $openid;
				$i['nickname'] = $fan->nickname;
				$i['delta'] = $coin;
				$i['total'] = $total;
				$this->insert('xxt_coin_log', $i, false);
				/*增量累计值*/
				$last = explode(',', date('Y,n,W,j', $fan->coin_last_at));
				$today = explode(',', date('Y,n,W,j', $current));
				if ($today[0] !== $last[0]) {
					$year = $month = $week = $day = $coin;
				} else {
					$year = $fan->coin_year + $coin;
					if ($today[1] !== $last[1]) {
						$month = $week = $day = $coin;
					} else {
						$month = $fan->coin_month + $coin;
						if ($today[2] !== $last[2]) {
							$week = $day = $coin;
						} else {
							$week = $fan->coin_week + $coin;
							if ($today[3] !== $last[3]) {
								$day = $coin;
							} else {
								$day = $fan->coin_day + $coin;
							}
						}
					}
				}
				/*更新数据*/
				$sql = "update xxt_fans set";
				$sql .= " coin=$total,coin_last_at=$current";
				$sql .= ",coin_day=$day,coin_week=$week,coin_month=$month,coin_year=$year";
				$sql .= " where mpid='$mpid' and openid='$openid'";
				$this->update($sql);
			}
		}

		return $coin;
	}
}