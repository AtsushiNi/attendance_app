import React, { useState, useEffect } from 'react'
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarContent
} from 'react-pro-sidebar'
import {
  FaHeart,
  FaUser,
  FaUserCheck,
  FaRegSun
} from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import { MdGroup } from 'react-icons/md'

export const Sidebar = (props) => {
  const { currentUser } = props
  const params = useLocation()
  const getStyle = (id) => {
    if(params.pathname.indexOf(id) !== -1)
      return(
        {
          backgroundColor: 'rgba(255,255,255,0.1)'
        }
      )
    else {
      return({})
    }
  }

  return (
    <ProSidebar>
      <SidebarHeader>
        <div
          style={{
            padding: '24px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: '1px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Attendance App
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Menu iconShape='square'>
          <SubMenu title='マイページ' icon={<FaHeart />}>
            <MenuItem style={getStyle('mypage/stamping')}>
              打刻
              <Link to='/mypage/stamping' />
            </MenuItem>
            <MenuItem style={getStyle('mypage/attendances')}>
              出勤簿
              <Link to='/mypage/attendances' />
            </MenuItem>
            <MenuItem>申請</MenuItem>
            <MenuItem style={getStyle('mypage/users')}>
              メンバー
              <Link to='/mypage/users' />
            </MenuItem>
            <MenuItem style={getStyle('mypage/groups')}>
              所属部署
              <Link to='/mypage/groups' />
            </MenuItem>
          </SubMenu>
          <MenuItem icon={<FaUserCheck />} style={getStyle('application')} id='application'>
            承認
            <Link to='/applications' />
          </MenuItem>
          {
            currentUser?.is_admin &&
            <MenuItem icon={<MdGroup />} style={getStyle('groups')} id='groups'>
              部署
              <Link to='/groups' />
            </MenuItem>
          }
          {
            currentUser?.is_admin &&
            <MenuItem icon={<FaUser />} style={getStyle('users')} id='users'>
              社員
              <Link to='/users' />
            </MenuItem>
          }
        </Menu>
        <Menu>
          <MenuItem icon={<FaRegSun />}>
            設定
            <Link to='/settings' />
          </MenuItem>
        </Menu>
      </SidebarContent>
    </ProSidebar>
  )
}
