/**
 * @description 解析XML文件
 * @author yehaifeng
 * @date 2024-09-18
 */
export class parseXmlEvent {
    public xmlDoc: Document;
    public startTagName = 'bpmn2:startEvent';
    public endTagName = 'bpmn2:endEvent';
    public gateweyTagName = 'bpmn2:parallelGateway';
    public userTaskTagName = 'bpmn2:userTask';
    public outgoingTagName = 'bpmn2:outgoing';
    public incomingTagName = 'bpmn2:incoming';
    public startNode: Object;
    public startNodeOutgoing = '';
    public endNode: Object;
    public endNodeIncoming = '';
    public userTaskNodes: Array;
    public gateweyNodes: Array;
    public outgoingNodes: Array;
    public incomingNodes: Array;
    public result: Array<Object>;
    public findEnd = false;
    public checkError = false;
    public errorInfo = '';
    constructor(xml: String) {
        // 使用DOMParser解析XML字符串;
        // console.log(JSON.stringify(xml));
        let parser = new DOMParser();
        this.xmlDoc = parser.parseFromString(xml, 'text/xml');
        this.checkStartNode();
        this.checkEndNode();
        this.checkUserTaskNode();
        this.checkGateweyNode();
        this.outgoingNodes = Array.from(this.xmlDoc.getElementsByTagName(this.outgoingTagName));
        this.incomingNodes = Array.from(this.xmlDoc.getElementsByTagName(this.incomingTagName));
        this.result = [];
    }
    /**
     * checkStartNode
     */
    public checkStartNode() {
        // 必须要有一个开始节点
        if (Array.from(this.xmlDoc.getElementsByTagName(this.startTagName)).length == 0) {
            this.errorInfo = '必须要有一个开始节点';
            this.checkError = true;
            this.logError();
            return false;
        }
        // 只能有一个开始节点
        Array.from(this.xmlDoc.getElementsByTagName(this.startTagName)).forEach((item, index) => {
            if (index > 0) {
                this.errorInfo = '只能有一个开始节点';
                this.checkError = true;
                this.logError();
                return false;
            }
            this.startNode = item;
        });
        // 开始节点有且只有一个 outgoing 节点
        let length = Array.from(this.startNode.children).filter((item) => {
            this.startNodeOutgoing = item.innerHTML;
            return item.tagName == this.outgoingTagName;
        }).length;
        if (length < 1) {
            this.checkError = true;
            this.errorInfo = '开始节没有指向下一个节点';
            this.logError();
        }
        if (length > 1) {
            this.checkError = true;
            this.errorInfo = '开始节只能指向一个下一个节点';
            this.logError();
        }
        length = Array.from(this.startNode.children).filter((item) => item.tagName == this.incomingTagName).length;
        if (length) {
            this.checkError = true;
            this.errorInfo = '开始节点不能有入边';
            this.logError();
            return false;
        }

        // else {
        //     return Array.from(node.children)[0]['innerHTML'];
        // }
    }
    /**
     * checkEndNode
     */
    public checkEndNode() {
        // 必须要有一个结束节点
        if (Array.from(this.xmlDoc.getElementsByTagName(this.endTagName)).length == 0) {
            this.errorInfo = '必须要有一个结束节点';
            this.checkError = true;
            return false;
        }
        // 只能有一个结束节点
        Array.from(this.xmlDoc.getElementsByTagName(this.endTagName)).forEach((item, index) => {
            if (index > 0) {
                this.errorInfo = '只能有一个结束节点';
                this.checkError = true;
                return false;
            }
            this.endNode = item;
        });
        length = Array.from(this.endNode.children).filter((item) => {
            this.endNodeIncoming = item.innerHTML;
            return item.tagName == this.outgoingTagName;
        }).length;
        if (length) {
            this.checkError = true;
            this.errorInfo = '结束节点不能有出边';
            this.logError();
            return false;
        }
    }
    /**
     * checkUserTaskNode
     */
    public checkUserTaskNode() {
        this.userTaskNodes = Array.from(this.xmlDoc.getElementsByTagName(this.userTaskTagName));
        // 每个用户任务节点必须有一个incoming和一个outgoing
        this.userTaskNodes.forEach((item, index) => {
            let length = Array.from(item.children).filter((item) => item.tagName == this.outgoingTagName).length;
            if (!length) {
                this.checkError = true;
                this.errorInfo = '每一个任务节点必须有一个出边';
                this.logError();
                return false;
            }
            length = Array.from(item.children).filter((item) => item.tagName == this.incomingTagName).length;
            if (!length) {
                this.checkError = true;
                this.errorInfo = '每一个任务节点必须有一个入边';
                this.logError();
                return false;
            }
        });
    }
    /**
     * check
     */
    public checkGateweyNode() {
        this.gateweyNodes = Array.from(this.xmlDoc.getElementsByTagName(this.gateweyTagName));
        // 每个用户任务节点必须有一个incoming和一个outgoing
        this.gateweyNodes.forEach((item, index) => {
            let length = Array.from(item.children).filter((item) => item.tagName == this.outgoingTagName).length;
            if (!length) {
                this.checkError = true;
                this.errorInfo = '每一个并行节点必须有一个出边';
                this.logError();
                return false;
            }
            length = Array.from(item.children).filter((item) => item.tagName == this.incomingTagName).length;
            if (!length) {
                this.checkError = true;
                this.errorInfo = '每一个并行节点必须有一个入边';
                this.logError();
                return false;
            }
        });
    }
    /**
     * checkFunc
     */
    public logError() {
        if (this.checkError) {
            ElMessage({ type: 'error', message: this.errorInfo });
            return false;
        } else {
            return true;
        }
    }
    /**
     * 通过 outgoing 获取下一个主节点（开始节点、结束节点、用户节点、并行节点）
     */
    public getNodeByOutgoing(id) {
        let node = null;
        this.incomingNodes.forEach((item) => {
            if (item.innerHTML == id) {
                node = item.parentElement;
                return true;
            }
        });
        if (node.tagName === this.endTagName) {
            this.findEnd = true;
        }
        return node;
    }
    /**
     * 解析用户任务节点信息
     */
    public parseUserTaskNodeInfo(node) {
        let info = {};
        info.id = node.getAttribute('id');
        info.name = node.getAttribute('name');
        info.taskId = node.getAttribute('taskId');
        let outgoingArray = [];
        Array.from(node.children).forEach((item) => {
            if (item.tagName == this.outgoingTagName) {
                outgoingArray.push(item.innerHTML);
            }
        });
        if (outgoingArray.length && outgoingArray.length > 1) {
            this.checkError = true;
            this.errorInfo = '任务节点有且只有一个出边';
            this.logError();
            return false;
        }
        info.outgoing = outgoingArray[0];
        return info;
    }
    public parseGateweyNodeInfo(node) {
        let info = {};
        info.outgoing = [];
        Array.from(node.children).forEach((item) => {
            if (item.tagName == this.outgoingTagName) {
                info.outgoing.push(item.innerHTML);
            }
        });
        return info;
    }
    /**
     * 开始解析
     */
    public start() {
        let node = this.getNodeByOutgoing(this.startNodeOutgoing);
        // 算法原则：从左到右，从上到下，直到找到结束节点
        let gateweyRes = [];
        while (!this.findEnd) {
            let info = {};
            // 任务节点
            if (node.tagName == this.userTaskTagName) {
                if (gateweyRes.length) {
                    let res = [];
                    for (let i = 0; i < gateweyRes.length; i++) {
                        const element = gateweyRes[i];
                        info = this.parseUserTaskNodeInfo(element);
                        res.push(info);
                    }
                    this.result.push(res);
                    gateweyRes = [];
                    // 任意一个节点继续去寻找下一个节点
                    node = this.getNodeByOutgoing(info.outgoing);
                } else {
                    info = this.parseUserTaskNodeInfo(node);
                    this.result.push([info]);
                    node = this.getNodeByOutgoing(info.outgoing);
                }
            }
            // 并行节点
            if (node.tagName == this.gateweyTagName) {
                let outgoingArray = this.parseGateweyNodeInfo(node).outgoing;
                outgoingArray.forEach((outgoing) => {
                    node = this.getNodeByOutgoing(outgoing);
                    if (node.tagName == this.gateweyTagName) {
                        this.checkError = true;
                        this.errorInfo = '并行节点的任意下一个节点必须是任务节点';
                        this.logError();
                    } else {
                        gateweyRes.push(node);
                    }
                });
            }
        }
        console.log(this.result);
        return this.result;
    }
}
