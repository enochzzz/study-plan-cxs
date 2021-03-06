/**
 * token输入框
 */
function tokenInput() {
  tokenBtnStyle();
  submitBtnStyle();
}

/**
 * issue参数输入框
 */
function issuesInput() {
  submitBtnStyle();
}

/**
 * token更新按钮
 * @returns 
 */
function updateToken() {
  if (!git_token.value) {
    return;
  }
  vscode.postMessage({
    command: 'setStorage',
    content: {
      key: 'git_token_study_plan',
      value: git_token.value
    }
  });
  vscode.postMessage({
    command: 'initOct'
  });
  tokenstatus.innerHTML = '已配置';
}

/**
 * 插入模板
 */
function insert() {
  mdArea.innerHTML = `
## 每日计划
- [ ] 吃饭
- [ ] 睡觉
- [ ] 打豆豆
      `;
  mdConverter();
  submitBtnStyle();
}

/**
 * 插入上次提交内容
 */
function insertPre() {
  vscode.postMessage({
    command: 'getStorage',
    content: {
      key: 'pre_study_plan'
    }
  });
}

/**
 * 提交
 * @returns 
 */
function submit() {
  if (!mdArea.value || !issue_number.value || !git_token.value) {
    return;
  }
  vscode.postMessage({
    command: 'setStorage',
    content: {
      key: 'pre_study_plan',
      value: mdArea.value
    }
  });
  vscode.postMessage({
    command: 'submit',
    content: {
      body: mdArea.value,
      number: issue_number.value
    }
  });
}

/**
 * markdown 转换
 */
function mdConverter() {
  let md = mdArea.value;
  viewArea.innerHTML = marked.parse(md);
}

/**
 * 消息处理
 * @param {*} event 
 */
function messageHandle(event) {
  const message = event.data;
  switch (message.command) {
    case 'get_issue_fail_webview':
      issue_title.innerHTML = message.content;
      issue_btn.classList.remove('display_none');
      break;
    case 'today_issue_number_webview':
      issueNumberHandle(message);
      break;
    case 'info_webview':
      createLog(`${message.content.text}！`, message.content.type || null);
      break;
    case 'success_webview':
      mdArea.innerHTML = '';
      mdConverter();
      submitBtnStyle();
      createLog(`${message.content}！`, 'success');
      break;
    case 'getStorage_webview':
      getStorageHandle(message.type, message.content);
      break;
    default:
      break;
  }
};

/**
 * 获取到今日issue
 * @param {*} message 
 */
function issueNumberHandle(message) {
  issue_number.value = message.content.number;
  issue_title.innerText = `今日issue：${message.content.title}`;
  issue_btn.classList.add('display_none');
}

/**
 * 处理storage
 * @param {*} type 
 * @param {*} content 
 */
function getStorageHandle(type, content) {
  switch (type) {
    case 'pre_study_plan':
      try {
        mdArea.innerHTML = content || '';
        mdConverter();
        submitBtnStyle();
      } catch (error) {
        createLog(`插入失败，请重试或者选择其他操作！`);
      }
      break;
    case 'git_token_study_plan':
      try {
        let token = content;
        git_token.value = token || '';
        tokenstatus.innerHTML = token ? '已配置' : '未配置（配置方法见下方提示）';
      } catch (error) {
        createLog(`获取本地存储token参数失败，请重新填写！`);
      }
      tokenBtnStyle();
      break;
    default:
      break;
  }
}