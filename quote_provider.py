"""只需替换 get_quote 即可接入行情，不需要修改网页。

返回格式：
{
    'symbol': 'AAPL',
    'price': 123.45,      # 数值类型；此处仅演示格式，并非实际报价
    'currency': 'USD',
    'asOf': '2026-09-08T12:00:00Z',  # 数据源的报价时间
    'source': '你的行情提供商名称'
}

API 密钥应保留在后端环境变量中，不要写入 dist/app.js。
后续接入时按行情商文档实现请求、超时、错误处理及价格单位转换。
"""

def get_quote(symbol: str) -> dict:
    raise NotImplementedError('No quote provider configured')
