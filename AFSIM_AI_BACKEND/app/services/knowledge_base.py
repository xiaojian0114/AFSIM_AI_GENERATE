import os
from pathlib import Path
from typing import List, Optional
from ..config import settings


class KnowledgeBase:
    """本地知识库服务"""
    
    def __init__(self, base_path: Optional[str] = None):
        # 显式获取知识库路径
        if base_path:
            self.base_path = Path(base_path)
        else:
            # 使用 settings 的知识库路径
            kb_path = settings.knowledge_base_path
            self.base_path = Path(kb_path)
        
        self._cache: Optional[str] = None
        self._files: List[Path] = []
    
    def load(self) -> str:
        """加载所有知识库文件并合并"""
        if self._cache:
            return self._cache
        
        content_parts = []
        
        # 调试信息
        print(f"[KnowledgeBase] 知识库路径: {self.base_path}")
        print(f"[KnowledgeBase] 路径是否存在: {self.base_path.exists()}")
        
        if not self.base_path.exists():
            error_msg = f"知识库目录不存在: {self.base_path}"
            print(f"[KnowledgeBase] {error_msg}")
            return error_msg
        
        # 收集所有 .md 文件
        self._files = list(self.base_path.glob("*.md"))
        print(f"[KnowledgeBase] 找到 {len(self._files)} 个知识库文件")
        
        for file_path in sorted(self._files):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    file_content = f.read()
                    content_parts.append(f"# {file_path.stem.replace('_', ' ').title()}\n\n{file_content}\n")
            except Exception as e:
                content_parts.append(f"# {file_path.name}\n\n加载失败: {str(e)}\n")
        
        self._cache = "\n\n---\n\n".join(content_parts)
        return self._cache
    
    def get_system_instruction(self) -> str:
        """获取系统提示词"""
        knowledge = self.load()
        
        return f"""你是一个专业的 AFSIM (Advanced Framework for Simulation and Modeling) 脚本生成助手。

## 你的任务
根据用户的描述，生成准确的 AFSIM 脚本代码。

## 重要约束
1. 只生成 AFSIM 脚本，不要生成其他语言的代码
2. 使用 AFSIM 的标准语法和命令
3. 脚本应该可以直接运行

## 本地知识库参考
以下是 AFSIM 相关的知识和最佳实践：

{knowledge}

## 输出格式
请用以下格式返回结果：

### AFSIM 脚本
```afsim
[在这里放置生成的 AFSIM 脚本代码]
```

### 说明
[简要说明脚本的功能和关键参数]

## 注意事项
- 确保使用正确的 AFSIM 命令和语法
- 包含必要的初始化代码
- 添加注释以提高可读性"""
    
    def get_file_list(self) -> List[dict]:
        """获取知识库文件列表"""
        if not self._files:
            self.load()
        
        return [
            {
                "name": f.name,
                "path": str(f),
                "size": f.stat().st_size if f.exists() else 0
            }
            for f in self._files
        ]


knowledge_base = KnowledgeBase()
