(function() {
    xxtApp.register.controller('tmplmsgCtrl', ['$scope', 'http2', '$modal', function($scope, http2, $modal) {
        $scope.$parent.subView = 'tmplmsg';
        $scope.orderEvts = [{
            id: 'submit_order',
            label: '用户提交订单'
        }, {
            id: 'pay_order',
            label: '用户完成支付'
        }, {
            id: 'feedback_order',
            label: '客服反馈订单'
        }];
        http2.get('/rest/mp/app/merchant/catelog/get?shopId=' + $scope.shopId, function(rsp) {
            $scope.catelogs = rsp.data;
            if (rsp.data.length) {
                $scope.selectedCatelog = rsp.data[0];
            }
        });
        http2.get('/rest/mp/matter/tmplmsg/list', function(rsp) {
            $scope.tmplmsgs = rsp.data;
        });
        $scope.selectCatelog = function() {};
        $scope.choose = function(orderEvt) {
            var url;
            url = '/rest/mp/matter/tmplmsg/mappingGet';
            url += '?id=' + $scope.selectedCatelog[orderEvt.id + '_tmplmsg'];
            http2.get(url, function(rsp) {
                var def, i, l, o, prop;
                def = rsp.data;
                if (def.msgid) {
                    for (i = 0, l = $scope.tmplmsgs.length; i < l; i++) {
                        o = $scope.tmplmsgs[i];
                        if (o.id === def.msgid) {
                            orderEvt.tmplmsg = o;
                            break;
                        }
                    }
                } else {
                    orderEvt.tmplmsg = null;
                }
                if (def.mapping) {
                    for (i in def.mapping) {
                        o = def.mapping[i];
                        switch (o.src) {
                            case 'product':
                                $scope.selectedCatelog.properties.forEach(function(v) {
                                    if (v.id == o.id) {
                                        prop = v;
                                        return false;
                                    }
                                });
                                break;
                            case 'order':
                                if (o.id === '__orderSn') {
                                    prop = {
                                        id: '__orderSn',
                                        name: '订单号'
                                    };
                                } else if (o.id === '__orderState') {
                                    prop = {
                                        id: '__orderState',
                                        name: '订单状态'
                                    };
                                } else {
                                    $scope.selectedCatelog.orderProperties.forEach(function(v) {
                                        if (v.id == o.id) {
                                            prop = v;
                                            return false;
                                        }
                                    });
                                }
                                break;
                            case 'feedback':
                                $scope.selectedCatelog.feedbackProperties.forEach(function(v) {
                                    if (v.id == o.id) {
                                        prop = v;
                                        return false;
                                    }
                                });
                                break;
                        }
                        if (prop) {
                            def.mapping[i] = prop;
                            def.mapping[i].src = o.src;
                        }
                    }
                    orderEvt.mapping = def.mapping;
                    console.log('om', orderEvt.mapping);
                } else {
                    orderEvt.mapping = {};
                }
                $scope.selectedOrderEvt = orderEvt;
            });
        };
        $scope.selectTmplmsg = function() {
            $modal.open({
                templateUrl: 'tmplmsgSelector.html',
                backdrop: 'static',
                resolve: {
                    tmplmsgs: function() {
                        return $scope.tmplmsgs;
                    }
                },
                controller: ['$modalInstance', '$scope', 'tmplmsgs', function($mi, $scope2, tmplmsgs) {
                    $scope2.tmplmsgs = tmplmsgs;
                    $scope2.data = {};
                    $scope2.close = function() {
                        $mi.dismiss();
                    };
                    $scope2.ok = function() {
                        $mi.close($scope2.data);
                    };
                }]
            }).result.then(function(data) {
                $scope.selectedOrderEvt.tmplmsg = data.selected;
            });
        };
        $scope.selectProperty = function(tmplmsgProp) {
            $modal.open({
                templateUrl: 'propertySelector.html',
                backdrop: 'static',
                resolve: {
                    catelog: function() {
                        return $scope.selectedCatelog;
                    }
                },
                controller: ['$modalInstance', '$scope', 'catelog', function($mi, $scope2, catelog) {
                    $scope2.catelog = catelog;
                    $scope2.orderProperties = angular.copy(catelog.orderProperties);
                    $scope2.orderProperties.push({
                        id: '__orderSn',
                        name: '订单号'
                    });
                    $scope2.orderProperties.push({
                        id: '__orderState',
                        name: '订单状态'
                    });
                    $scope2.data = {
                        srcProp: 'product'
                    };
                    $scope2.close = function() {
                        $mi.dismiss();
                    };
                    $scope2.ok = function() {
                        $mi.close($scope2.data);
                    };
                }]
            }).result.then(function(data) {
                data.selected.src = data.srcProp;
                $scope.selectedOrderEvt.mapping[tmplmsgProp.id] = data.selected;
            });
        };
        $scope.save = function() {
            var sov, i, m, posted, url;
            sov = $scope.selectedOrderEvt;
            posted = {
                evt: sov.id,
                msgid: sov.tmplmsg.id,
                mapping: {}
            };
            for (i in sov.mapping) {
                m = sov.mapping[i];
                posted.mapping[i] = {
                    src: m.src,
                    id: m.id
                }
            }
            url = '/rest/mp/app/merchant/tmplmsg/setup';
            url += '?catelog=' + $scope.selectedCatelog.id;
            url += '&mappingid=' + $scope.selectedCatelog[sov.id + '_tmplmsg'];
            http2.post(url, posted, function(rsp) {
                alert(rsp.data);
            });
        };
    }]);
})();